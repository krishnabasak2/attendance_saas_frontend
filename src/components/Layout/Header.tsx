interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm">
      <button
        onClick={onMenuClick}
        className="mr-4 rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </header>
  );
}
