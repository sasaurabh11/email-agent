import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmail } from "../context/EmailContext";
import {
  Mail,
  Filter,
  FileText,
  Sparkles,
  RefreshCw,
  Brain,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner, {
  LoadingSpinnerWithText,
} from "../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { emails, fetchEmails, loading, filterAllEmails } = useEmail();
  const navigate = useNavigate();
  const [processingStats, setProcessingStats] = useState({
    totalProcessed: 0,
    aiClassified: 0,
    aiSummarized: 0,
    pendingActions: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchEmails(user.id);
    }
  }, [user, fetchEmails]);

  useEffect(() => {
    if (emails.length > 0) {
      const stats = {
        totalProcessed: emails.length,
        aiClassified: emails.filter((e) => e.classification).length,
        aiSummarized: emails.filter((e) => e.summaries).length,
        pendingActions: emails.filter((e) => !e.classification).length,
      };
      setProcessingStats(stats);
    }
  }, [emails]);

  const getClassificationStats = () => {
    const classifications = emails.reduce((acc, email) => {
      const classification = email.classification || "unclassified";
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {});
    return classifications;
  };

  const getRecentActivity = () => {
    return emails
      .filter((e) => e.classification || e.summaries)
      .slice(0, 5)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "filter":
        filterAllEmails(user.id);
        break;
      case "summaries":
        navigate("/summaries");
        break;
      case "emails":
        navigate("/emails");
        break;
      case "search":
        navigate("/emails");
        break;
      case "agent":
        navigate("/emails");
        break;
      default:
        break;
    }
  };

  const classificationStats = getClassificationStats();
  const recentActivity = getRecentActivity();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinnerWithText text="Loading Emails..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white text-balance">AI Email Assistant</h1>
          <p className="text-gray-400 mt-1">
            Your intelligent email management dashboard
          </p>
        </div>
        <Button
          onClick={() => fetchEmails(user.id)}
          variant="outline"
          size="sm"
          className="glass border-subtle hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-float transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-soft">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Total Emails
                </p>
                <p className="text-2xl font-bold text-white">
                  {processingStats.totalProcessed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-float transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-soft">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  AI Classified
                </p>
                <p className="text-2xl font-bold text-white">
                  {processingStats.aiClassified}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {processingStats.totalProcessed > 0
                    ? `${Math.round(
                        (processingStats.aiClassified /
                          processingStats.totalProcessed) *
                          100
                      )}% processed`
                    : "0% processed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-float transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-soft">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  AI Summarized
                </p>
                <p className="text-2xl font-bold text-white">
                  {processingStats.aiSummarized}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-float transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-soft">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Pending Actions
                </p>
                <p className="text-2xl font-bold text-white">
                  {processingStats.pendingActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Classification Overview */}
        <Card>
          <CardHeader className="border-subtle">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-primary" />
              Email Classification
            </h2>
          </CardHeader>
          <CardContent>
            {Object.keys(classificationStats).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No classifications yet
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(classificationStats).map(
                  ([classification, count]) => (
                    <div
                      key={classification}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {classification}
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-400 mr-3">
                          {count}
                        </span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-gradient h-2 rounded-full"
                            style={{
                              width: `${
                                (count / processingStats.totalProcessed) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Agent Quick Actions */}
        <Card>
          <CardHeader className="border-subtle">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              AI Agent Actions
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => handleQuickAction("filter")}
                variant="outline"
                className="w-full justify-start glass border-subtle hover:bg-gray-800 text-gray-300"
                disabled={loading}
              >
                <Brain className="w-4 h-4 mr-2 text-primary" />
                Classify All Emails
                <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
              </Button>
              <Button
                onClick={() => handleQuickAction("summaries")}
                variant="outline"
                className="w-full justify-start glass border-subtle hover:bg-gray-800 text-gray-300"
              >
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Generate Summaries
                <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
              </Button>
              <Button
                onClick={() => handleQuickAction("search")}
                variant="outline"
                className="w-full justify-start glass border-subtle hover:bg-gray-800 text-gray-300"
              >
                <Search className="w-4 h-4 mr-2 text-primary" />
                AI Search Emails
                <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
              </Button>
              <Button
                onClick={() => handleQuickAction("agent")}
                variant="outline"
                className="w-full justify-start glass border-subtle hover:bg-gray-800 text-gray-300"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Run AI Agent
                <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Activity */}
        <Card>
          <CardHeader className="border-subtle">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Recent AI Activity
            </h2>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-3 border border-subtle rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {email.subject || "(No Subject)"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {email.sender}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {email.classification && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-soft text-primary">
                          {email.classification}
                        </span>
                      )}
                      {email.summaries && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to Main Features */}
      <Card>
        <CardHeader className="border-subtle">
          <h2 className="text-lg font-semibold text-white">Quick Access</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate("/emails")}
              variant="outline"
              className="h-20 flex-col glass border-subtle hover:bg-gray-800 text-gray-300"
            >
              <Mail className="w-6 h-6 mb-2 text-primary" />
              <span>Email Inbox</span>
            </Button>
            <Button
              onClick={() => navigate("/summaries")}
              variant="outline"
              className="h-20 flex-col glass border-subtle hover:bg-gray-800 text-gray-300"
            >
              <FileText className="w-6 h-6 mb-2 text-primary" />
              <span>Summaries</span>
            </Button>
            <Button
              onClick={() => navigate("/filter")}
              variant="outline"
              className="h-20 flex-col glass border-subtle hover:bg-gray-800 text-gray-300"
            >
              <Filter className="w-6 h-6 mb-2 text-primary" />
              <span>Filtered Emails</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
