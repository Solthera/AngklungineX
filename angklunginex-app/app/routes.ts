import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("free-play", "features/free-play/free-play.tsx"),
  route("*", "routes/splat.tsx"),
] satisfies RouteConfig;
