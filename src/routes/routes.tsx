import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BeerPage from "../pages/BeerPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  { path: "/:id", element: <BeerPage /> },
]);
