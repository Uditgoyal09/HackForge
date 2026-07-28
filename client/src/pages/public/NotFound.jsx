import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-text-secondary mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
};
