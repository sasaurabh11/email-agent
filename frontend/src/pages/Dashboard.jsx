import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmail } from '../contexts/EmailContext';
import { useApp } from '../contexts/AppContext';
import { Mail, Filter, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { emails, fetchEmails } = useEmail();
  const { loading } = useApp();

  useEffect(() => {
    if (user) {
      fetchEmails(user.id);
    }
  }, [user, fetchEmails]);

  const stats = [
    {
      title: 'Total Emails',
      value: emails.length,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Important Emails',
      value: emails.filter(e => e.classification === 'important').length,
      icon: Filter,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Summarized',
      value: emails.filter(e => e.summaries).length,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const recentEmails = emails.slice(0, 5);

  if (loading && !emails.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => fetchEmails(user.id)}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Emails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent Emails</h2>
          </CardHeader>
          <CardContent>
            {recentEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No emails found</p>
            ) : (
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {email.subject || '(No Subject)'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {email.sender}
                      </p>
                    </div>
                    {email.classification && (
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        email.classification === 'important' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {email.classification}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Filter All Emails
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Compose New Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;