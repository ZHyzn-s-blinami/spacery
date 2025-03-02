import CoworkingBooking from '../components/reservation';

function Home() {
  return (
    <div>
      <CoworkingBooking 
        isAdmin={false}
      />
    </div>
  );
}

export default Home;
