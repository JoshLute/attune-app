
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-3xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)] bg-gray-50">
          <h1 className="text-6xl font-bold text-[hsl(var(--attune-purple))] mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Oops! This page doesn't exist.</p>
          <Link to="/">
            <Button className="shadow-[3px_3px_8px_rgba(0,0,0,0.1),_-3px_-3px_8px_rgba(255,255,255,0.8)] hover:shadow-[1px_1px_4px_rgba(0,0,0,0.1),_-1px_-1px_4px_rgba(255,255,255,0.8)] transition-all bg-[hsl(var(--attune-purple))]">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
