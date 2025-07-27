/*
  # Add INSERT policy for chambers table

  1. Security
    - Add policy to allow authenticated users to insert chambers where user_id matches auth.uid()
    - This enables chamber signup functionality while maintaining security
*/

CREATE POLICY "Users can create their own chamber"
  ON chambers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());