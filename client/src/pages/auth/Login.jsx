import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const Login = () => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button className="w-full" variant="primary">Sign In</Button>
        <div className="text-sm text-text-secondary text-center">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </CardFooter>
    </Card>
  );
};
