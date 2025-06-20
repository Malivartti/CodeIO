import { usersStore } from '@entities/admin';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import UserForm from '../DashboardUsersPage/ui/components/UserForm';


const CreateUserPage: FC = observer(() => {
  const navigate = useNavigate();
  const { isCreating, error } = usersStore;

  const handleSubmit = async (userData: any): Promise<boolean> => {
    const success = await usersStore.createUser(userData);
    if (success) {
      navigate('/dashboard/users');
    }
    return success;
  };

  const handleCancel = () => {
    navigate('/dashboard/users');
  };

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isCreating}
            error={error}
          />
        </div>
      </div>
    </Container>
  );
});

export default CreateUserPage;
