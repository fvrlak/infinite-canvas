"use client";

import dynamic from 'next/dynamic';
import { Dashboard } from '@/src/app/dashboard/page';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Canvas = dynamic(() => import('@/src/components/canvas/Canvas'), {
  ssr: false,
  loading: () => <p>Loading Canvas...</p>
});

interface NestedItem {
  name: string;
  children?: NestedItem[];
  isOpen?: boolean;
}

const Sidebar: React.FC = () => {
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState<boolean>(false);
  const [isSelfOpen, setIsSelfOpen] = useState<boolean>(false);
  const [environmentItems, setEnvironmentItems] = useState<NestedItem[]>([
    { name: 'Analytics', children: [], isOpen: false },
    { name: 'Business', children: [], isOpen: false },
    { name: 'Commerce', children: [], isOpen: false },
  ]);
  const [selfItems, setSelfItems] = useState<NestedItem[]>([
    { name: 'Axiom', children: [], isOpen: false },
    { name: 'Dreaming', children: [], isOpen: false },
    { name: 'Telemetry', children: [], isOpen: false },
  ]);

  const handleRenameItem = (section: 'environment' | 'self', index: number, newName: string) => {
    if (section === 'environment') {
      const updatedItems = [...environmentItems];
      updatedItems[index].name = newName;
      setEnvironmentItems(updatedItems);
    } else {
      const updatedItems = [...selfItems];
      updatedItems[index].name = newName;
      setSelfItems(updatedItems);
    }
  };

  const handleAddItem = (section: 'environment' | 'self', newItem: string) => {
    if (section === 'environment') {
      setEnvironmentItems([...environmentItems, { name: newItem, children: [], isOpen: false }]);
    } else {
      setSelfItems([...selfItems, { name: newItem, children: [], isOpen: false }]);
    }
  };

  const handleAddNestedItem = (section: 'environment' | 'self', parentIndex: number, newItem: string) => {
    if (section === 'environment') {
      const updatedItems = [...environmentItems];
      if (!updatedItems[parentIndex].children) {
        updatedItems[parentIndex].children = [];
      }
      updatedItems[parentIndex].children!.push({ name: newItem });
      setEnvironmentItems(updatedItems);
    } else {
      const updatedItems = [...selfItems];
      if (!updatedItems[parentIndex].children) {
        updatedItems[parentIndex].children = [];
      }
      updatedItems[parentIndex].children!.push({ name: newItem });
      setSelfItems(updatedItems);
    }
  };

  const toggleItemOpen = (section: 'environment' | 'self', index: number) => {
    if (section === 'environment') {
      const updatedItems = [...environmentItems];
      updatedItems[index].isOpen = !updatedItems[index].isOpen;
      setEnvironmentItems(updatedItems);
    } else {
      const updatedItems = [...selfItems];
      updatedItems[index].isOpen = !updatedItems[index].isOpen;
      setSelfItems(updatedItems);
    }
  };

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
            {environmentItems.map((item, index) => (
              <li key={index} className="mt-2">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleItemOpen('environment', index)}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleRenameItem('environment', index, e.target.value)}
                    className="bg-gray-700 text-white p-1"
                  />
                  {item.isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {item.isOpen && item.children && item.children.length > 0 && (
                  <ul className="ml-4 mt-2">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex} className="mt-2">
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => {
                            const updatedItems = [...environmentItems];
                            updatedItems[index].children![childIndex].name = e.target.value;
                            setEnvironmentItems(updatedItems);
                          }}
                          className="bg-gray-700 text-white p-1"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => handleAddNestedItem('environment', index, 'New Nested Item')}
                  className="ml-2 text-sm text-blue-400"
                >
                  + Add Nested Item
                </button>
              </li>
            ))}
            <li className="mt-2">
              <button
                onClick={() => handleAddItem('environment', 'New Item')}
                className="text-sm text-blue-400"
              >
                + Add Item
              </button>
            </li>
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
            {selfItems.map((item, index) => (
              <li key={index} className="mt-2">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleItemOpen('self', index)}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleRenameItem('self', index, e.target.value)}
                    className="bg-gray-700 text-white p-1"
                  />
                  {item.isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {item.isOpen && item.children && item.children.length > 0 && (
                  <ul className="ml-4 mt-2">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex} className="mt-2">
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => {
                            const updatedItems = [...selfItems];
                            updatedItems[index].children![childIndex].name = e.target.value;
                            setSelfItems(updatedItems);
                          }}
                          className="bg-gray-700 text-white p-1"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => handleAddNestedItem('self', index, 'New Nested Item')}
                  className="ml-2 text-sm text-blue-400"
                >
                  + Add Nested Item
                </button>
              </li>
            ))}
            <li className="mt-2">
              <button
                onClick={() => handleAddItem('self', 'New Item')}
                className="text-sm text-blue-400"
              >
                + Add Item
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4">
        <Canvas />
        {/* <Dashboard /> */}
      </main>
    </div>
  );
}
