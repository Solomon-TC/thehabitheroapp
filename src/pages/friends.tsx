import AuthWrapper from '../components/AuthWrapper';
import FriendsList from '../components/FriendsList';
import FriendRequests from '../components/FriendRequests';

function FriendsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Friends</h1>

      <div className="space-y-8">
        {/* Friend Requests Section */}
        <div className="rpg-panel">
          <h2 className="text-2xl font-pixel text-rpg-light mb-6">Friend Requests</h2>
          <FriendRequests />
        </div>

        {/* Friends List Section */}
        <div className="rpg-panel">
          <h2 className="text-2xl font-pixel text-rpg-light mb-6">Your Friends</h2>
          <FriendsList />
        </div>
      </div>
    </div>
  );
}

export default function Friends() {
  return (
    <AuthWrapper>
      <FriendsPage />
    </AuthWrapper>
  );
}
