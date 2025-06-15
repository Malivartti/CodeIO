import Container from '@widgets/Container';
import Header from '@widgets/Header';
import { FC } from 'react';


const CollectionsPage: FC = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />
      <Container>
        <div className="space-y-6">
          Collections Page
        </div>
      </Container>
    </div>
  );
};

export default CollectionsPage;
