import { AuthForm } from '../components/AuthForm';
import PageTitle from './PageTitle';

function Auth() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <PageTitle title="Аутенфикация" />
      <AuthForm />
    </div>
  );
}

export default Auth;
