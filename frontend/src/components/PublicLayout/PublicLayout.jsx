import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import FloatingActionButton from "../FloatingActionButton/FloatingActionButton";

// wraps every page except the admin section, which has its own
// AdminLayout (navbar + sidebar) instead
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <FloatingActionButton />
      <Footer />
    </>
  );
};

export default PublicLayout;
