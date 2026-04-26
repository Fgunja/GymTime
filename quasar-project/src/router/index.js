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

  // 🔥 JAVNE STRANICE (SVATKO MOŽE VIDJETI)
  const publicPages = ["/", "/login", "/register", "/cjenik"];

  const isPublic = publicPages.includes(to.path);

  // 🔥 ako nije login i nije public → blok
  if (!user && !isPublic) {
    return "/";
  }

  return true;
});

export default router;
