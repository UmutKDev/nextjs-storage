"use client";

import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow";

type WorkspaceState = {
  activeTeamId: string | null;
  activeTeamName: string | null;
  activeTeamRole: string | null;
  setActiveWorkspace: (
    team: { id: string; name: string; role: string } | null,
  ) => void;
  clearWorkspace: () => void;
};

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined;

const persistConfig = {
  name: "active-workspace",
  partialize: (state: WorkspaceState) => ({
    activeTeamId: state.activeTeamId,
    activeTeamName: state.activeTeamName,
    activeTeamRole: state.activeTeamRole,
  }),
  ...(storage ? { storage } : {}),
};

export const useWorkspaceStore = createWithEqualityFn<WorkspaceState>()(
  devtools(
    persist(
      (set) => ({
        activeTeamId: null,
        activeTeamName: null,
        activeTeamRole: null,

        setActiveWorkspace: (team) => {
          if (!team) {
            set(
              {
                activeTeamId: null,
                activeTeamName: null,
                activeTeamRole: null,
              },
              false,
              "setActiveWorkspace/personal",
            );
          } else {
            set(
              {
                activeTeamId: team.id,
                activeTeamName: team.name,
                activeTeamRole: team.role,
              },
              false,
              "setActiveWorkspace/team",
            );
          }
        },

        clearWorkspace: () => {
          set(
            {
              activeTeamId: null,
              activeTeamName: null,
              activeTeamRole: null,
            },
            false,
            "clearWorkspace",
          );
        },
      }),
      persistConfig,
    ),
    { name: "WorkspaceStore" },
  ),
);

export function useWorkspace(): WorkspaceState;
export function useWorkspace<T>(
  selector: (state: WorkspaceState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T;
export function useWorkspace<T>(
  selector?: (state: WorkspaceState) => T,
  equalityFn?: (left: T, right: T) => boolean,
) {
  const selectState = (selector ?? ((state: WorkspaceState) => state)) as (
    state: WorkspaceState,
  ) => T;
  return useWorkspaceStore(selectState, equalityFn ?? shallow);
}
