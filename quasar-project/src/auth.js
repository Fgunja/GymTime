import { reactive } from "vue";

const state = reactive({
  user: JSON.parse(localStorage.getItem("user")) || null,
});

export function useAuth() {
  const setUser = (user) => {
    state.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    state.user = null;
    localStorage.removeItem("user");
  };

  return {
    state,
    setUser,
    logout,
  };
}
