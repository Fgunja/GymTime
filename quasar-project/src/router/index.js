import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useAuth } from "src/auth";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuth();
  const user = auth.state.user;

  const publicPages = ["/", "/login", "/register", "/cjenik"];
  const isPublic = publicPages.includes(to.path);

  if (!user && !isPublic) {
    return "/";
  }

  // Ako je korisnik prijavljen i ide na "/" → preusmjeri na /app
  if (user && to.path === "/") {
    return "/app";
  }

  return true;
});

export default router;