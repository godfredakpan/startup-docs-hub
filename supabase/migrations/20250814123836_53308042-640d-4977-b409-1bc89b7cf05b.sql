-- Create team invitations table
CREATE TABLE public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for team invitations
CREATE POLICY "Company admins can create invitations" 
ON public.team_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.company_id = team_invitations.company_id 
    AND profiles.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Company members can view invitations" 
ON public.team_invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.company_id = team_invitations.company_id
  )
);

CREATE POLICY "Company admins can update invitations" 
ON public.team_invitations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.company_id = team_invitations.company_id 
    AND profiles.role IN ('admin', 'owner')
  )
);

-- Add function to clean up expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.team_invitations 
  WHERE expires_at < now() AND accepted_at IS NULL;
END;
$$;