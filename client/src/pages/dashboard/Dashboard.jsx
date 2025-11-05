const Dashboard = ({ islogged, isAdmin }) => {
  return (
    <section className="App">
      {islogged && isAdmin && <div>Admin Dashboard - Under Construction</div>}
    </section>
  );
};

export default Dashboard;
