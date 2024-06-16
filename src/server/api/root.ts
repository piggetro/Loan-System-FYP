import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user/user.procedure";
import { schoolAdminRouter } from "./routers/school-admin/school-admin.procedure";
import { loanRequestRouter } from "./routers/loans/loan-request.procedure";
import { loanRouter } from "./routers/loans/loan.procedure";
import { coursesRouter } from "./routers/school-admin/courses.procedure";
import { organisationUnitsRouter } from "./routers/school-admin/organisation-units.procedure";
import { equipmentRouter } from "./routers/equipment-management/equipment.procedure";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  schoolAdmin: schoolAdminRouter,
  loanRequest: loanRequestRouter,
  loan: loanRouter,
  courses: coursesRouter,
  organisationUnits: organisationUnitsRouter,
  equipment: equipmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
