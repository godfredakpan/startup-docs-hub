import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Mail, MoreVertical, Shield, User } from "lucide-react";
import { TeamInviteDialog } from "./TeamInviteDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

interface TeamMembersSectionProps {
  companyId: string;
  currentUserRole?: string;
}

export const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({
  companyId,
  currentUserRole,
}) => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  const canManageTeam = currentUserRole === 'admin' || currentUserRole === 'owner';

  useEffect(() => {
    fetchTeamData();
  }, [companyId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const { data: membersData, error: membersError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch pending invitations (if user can manage team)
      if (canManageTeam) {
        const { data: invitationsData, error: invitationsError } = await (supabase as any)
          .from('team_invitations')
          .select('*')
          .eq('company_id', companyId)
          .is('accepted_at', null)
          .order('created_at', { ascending: false });

        if (invitationsError) throw invitationsError;
        setInvitations(invitationsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading team data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully",
      });

      fetchTeamData();
    } catch (error: any) {
      toast({
        title: "Error cancelling invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>Manage your team members and invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
                <Badge variant="secondary" className="ml-2">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </Badge>
              </CardTitle>
              <CardDescription>Manage your team members and invitations</CardDescription>
            </div>
            
            {canManageTeam && (
              <Button onClick={() => setInviteDialogOpen(true)} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Team Members */}
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {member.role || 'member'}
                  </Badge>
                  
                  {canManageTeam && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive">
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {/* Pending Invitations */}
            {canManageTeam && invitations.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Pending Invitations ({invitations.length})
                </h4>
                
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • 
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getRoleIcon(invitation.role)}
                        {invitation.role}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Cancel Invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet</p>
                {canManageTeam && (
                  <p className="text-sm mt-1">Start by inviting your first team member</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        companyId={companyId}
        onInviteSent={fetchTeamData}
      />
    </>
  );
};