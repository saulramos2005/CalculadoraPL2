export default function EstadoSistema({ feedback }: { feedback: string }) {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Al cambiar de método, se conserva el
      último resultado de cada uno.
    </p>
  );
}