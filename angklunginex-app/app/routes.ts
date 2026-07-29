import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), 
  route("free-play", "routes/free-play.tsx")

] satisfies RouteConfig;
