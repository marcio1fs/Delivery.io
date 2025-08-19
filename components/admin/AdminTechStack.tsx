import React from 'react';
import { techStack } from '../../data';
import { TechCategory } from '../../types';
import Card from '../ui/Card';
import CodeIcon from '../icons/CodeIcon';

const AdminTechStack: React.FC = () => {

    const TechCategoryCard: React.FC<{ category: TechCategory }> = ({ category }) => (
        <Card>
            <h3 className="text-lg font-bold text-blue-400 mb-3">{category.title}</h3>
            <ul className="space-y-2">
                {category.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <CodeIcon className="w-4 h-4 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Tecnologias Utilizadas</h2>
            </div>
            <p className="text-gray-400 max-w-3xl">
                Esta plataforma é construída sobre uma pilha de tecnologia moderna, escalável e robusta para garantir confiabilidade e desempenho. Abaixo está uma visão geral das principais tecnologias e serviços utilizados.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(techStack).map(category => (
                    <TechCategoryCard key={category.title} category={category} />
                ))}
            </div>
        </div>
    );
};

export default AdminTechStack;