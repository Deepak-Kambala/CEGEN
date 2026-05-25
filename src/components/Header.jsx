export default function Header({ allTimeCount }) {
  return (
    <header className="app-header">
      <div className="logo">CEG<span>EN</span></div>
      <div className="counter-badge">
        Certificates Generated:&nbsp;
        <span className="num">{allTimeCount}</span>
      </div>
    </header>
  );
}
