const routes = [
  // PUBLIC
  {
    path: "/",
    component: () => import("layouts/PublicLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "login", component: () => import("pages/LoginPage.vue") },
      { path: "register", component: () => import("pages/RegisterPage.vue") },
      { path: "cjenik", component: () => import("pages/CjenikPage.vue") },
    ],
  },

  // APP (SVE LOGIRANO IDE OVDJE)
  {
    path: "/app",
    component: () => import("layouts/UserLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "termini", component: () => import("pages/TerminiPage.vue") },
      {
        path: "termini/:termin_id",
        component: () => import("pages/TerminDetaljiPage.vue"),
      },
      {
        path: "rezervacije",
        component: () => import("pages/RezervacijePage.vue"),
      },
      {
        path: "rezervacije/:rezervacija_id",
        component: () => import("pages/RezervacijaDetaljiPage.vue"),
      },
      {
        path: "profil",
        component: () => import("pages/ProfilPage.vue"),
      },
      {
        path: "obavijesti",
        component: () => import("pages/ObavijestiPage.vue"),
      },
      { path: "cjenik", component: () => import("pages/CjenikPage.vue") },
      {
        path: "korisnici",
        component: () => import("pages/PregledKorisnikaPage.vue"),
      }, 
    ],
  },

  // fallback
  {
    path: "/:catchAll(.*)*",
    redirect: "/",
  },
];

export default routes;
