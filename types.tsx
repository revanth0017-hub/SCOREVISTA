// Admin Sidebar Props Type
export interface AdminSidebarProps {
  sport: string;
  sportIcon?: string;
}

// Admin Page Header Props Type
export interface AdminPageHeaderProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}
