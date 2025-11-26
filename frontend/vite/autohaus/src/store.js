import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      permissions: [],

      // Set user and tokens
      setUser: (user, accessToken, refreshToken) => {
        set({
          user,
          isAuthenticated: true,
          accessToken,
          refreshToken,
        });
      },

      // Set permissions
      setPermissions: (permissions) => {
        set({ permissions });
      },

      // Update access token (for refresh)
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      // Logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          permissions: [],
        });
      },

      // Check if user has permission for an entity
      hasPermission: (entity, action) => {
        const { user, permissions } = get();

        // Superuser has all permissions
        if (user?.is_superuser) {
          return true;
        }

        // Check if user is CMS user
        if (!user?.is_cms_user) {
          return false;
        }

        // Check specific permission
        console.log({permissions})
        const entityPermissions = permissions.filter ? permissions.filter(perm => perm.entity == entity) : [];
        if (entityPermissions.length === 0) {
          return false;
        }

        const match = entityPermissions[0]
        switch (action) {
          case 'read':
            return match.can_read;
          case 'write':
          case 'create':
          case 'update':
            return match.can_write;
          case 'delete':
            return match.can_delete;
          default:
            return false;
        }
      },

      // Toast notifications
      toasts: [],

      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }));
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      // Loading state
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'autohaus-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
      }),
    }
  )
);

export default useStore;
