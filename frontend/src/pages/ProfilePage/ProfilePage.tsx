import Container from '@widgets/Container';
import Header from '@widgets/Header';
import { FC } from 'react';


const ProfilePage: FC = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />
      <Container>
        <div className="space-y-6">
          Profile Page
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;
