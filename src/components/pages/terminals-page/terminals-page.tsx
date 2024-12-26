interface TerminalsPageProps {
  terminalId: string;
}

const TerminalsPage = ({ terminalId }: TerminalsPageProps) => {
  console.log(terminalId);
  return <div>TerminalsPage</div>;
};

export default TerminalsPage;
