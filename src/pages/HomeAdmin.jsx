import CoworkingBooking from '../components/reservation';

function HomeAdmin() {
  return (
    <>
      <CoworkingBooking 
        isAdmin={true}
      />
    </>
  )
}

export default HomeAdmin;
