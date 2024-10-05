import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState<boolean>(false);
  const [isSelfOpen, setIsSelfOpen] = useState<boolean>(false);

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div>
        <h2
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsEnvironmentOpen(!isEnvironmentOpen)}
        >
          <span>Environment</span>
          {isEnvironmentOpen ? <FiChevronUp /> : <FiChevronDown />}
        </h2>
        {isEnvironmentOpen && (
          <ul className="ml-4 mt-2">
            <li className="mt-2">Analytics</li>
            <li className="mt-2">Business</li>
            <li className="mt-2">Commerce</li>
          </ul>
        )}
      </div>
      <div className="mt-4">
        <h2
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsSelfOpen(!isSelfOpen)}
        >
          <span>Self</span>
          {isSelfOpen ? <FiChevronUp /> : <FiChevronDown />}
        </h2>
        {isSelfOpen && (
          <ul className="ml-4 mt-2">
            <li className="mt-2">Axiom</li>
            <li className="mt-2">Dreaming</li>
            <li className="mt-2">Telemetry</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
