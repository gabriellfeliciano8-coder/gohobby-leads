import Link from 'next/link';

export default function Marca({ href = '/', sub }: { href?: string; sub?: string }) {
  return (
    <Link href={href} className="marca" aria-label="gohobby — início">
      <span className="go">go</span>
      <span className="hobby">hobby</span>
      {sub && <span className="marca-sub">{sub}</span>}
    </Link>
  );
}
