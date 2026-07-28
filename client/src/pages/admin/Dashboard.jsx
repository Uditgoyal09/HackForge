import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-text-secondary">Welcome to your HackVerse control panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Active Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
          </CardContent>
        </Card>
        {/* Additional mock metrics */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">No recent activity to display.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-text-secondary">You have no upcoming deadlines.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
