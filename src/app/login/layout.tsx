export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout sem sidebar, header e footer — tela cheia
  return <>{children}</>;
}
