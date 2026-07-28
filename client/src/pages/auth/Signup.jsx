import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const Signup = () => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join HackVerse and start your journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary">First Name</label>
            <Input placeholder="John" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary">Last Name</label>
            <Input placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <Input placeholder="name@example.com" type="email" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-primary">Password</label>
          <Input placeholder="••••••••" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" variant="primary">Sign Up</Button>
        <div className="text-sm text-text-secondary text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </CardFooter>
    </Card>
  );
};
