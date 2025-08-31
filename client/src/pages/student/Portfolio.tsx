import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { Image } from '@/components/ui/Image';

const Portfolio: React.FC = () => {
  const { user, student } = useAuth();
  const [activeTab, setActiveTab] = useState('About');

  const tabs = ['About', 'Experience', 'Skills', 'Social'];

  const experiences = [
    {
      id: 1,
      company: 'Tech Solutions Inc.',
      position: 'Software Engineering Intern',
      period: 'Summer 2023',
      description: 'Developed and maintained web applications using React and Node.js. Collaborated with a team of engineers to implement new features and improve existing functionality.',
      logo: 'TCH',
      logoColor: 'bg-blue-600',
    },
    {
      id: 2,
      company: 'Columbia University',
      position: 'Research Assistant',
      period: '2022 - 2023',
      description: 'Conducted research on machine learning algorithms and their applications in natural language processing. Published a paper in a peer-reviewed conference.',
      logo: 'CU',
      logoColor: 'bg-green-600',
    },
  ];

  const skills = [
    'Java', 'Python', 'React', 'Node.js', 'Machine Learning', 'Web Development'
  ];

  const socialLinks = [
    {
      platform: 'GitHub',
      url: 'github.com/olivia-bennett',
      icon: '⚡',
    },
    {
      platform: 'LinkedIn',
      url: 'linkedin.com/in/olivia-bennett',
      icon: '💼',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'About':
        return (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              <p className="text-gray-300 leading-relaxed">
                Highly motivated and creative software engineering student with a passion for developing innovative 
                solutions. Seeking opportunities to apply technical skills and contribute to impactful projects. Proficient in Java, Python, and web 
                development frameworks.
              </p>
            </div>
          </motion.div>
        );

      case 'Experience':
        return (
          <motion.div
            key="experience"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Experience</h3>
            
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className={`w-12 h-12 ${exp.logoColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{exp.logo}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{exp.company}</h4>
                        <p className="text-gray-400 text-sm">{exp.position}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{exp.period}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'Skills':
        return (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Skills</h3>
            
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-slate-700 text-blue-300 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        );

      case 'Social':
        return (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Social</h3>
            
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{link.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{link.platform}</p>
                    <p className="text-blue-400 text-sm">{link.url}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&q=80" 
              alt={student?.fullName || 'Student'}
              className="w-full h-full rounded-full object-cover"
              fallbackIcon="user"
              fallbackClassName="w-12 h-12 text-white"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {student?.fullName || user?.email || 'Student'}
          </h1>
          <p className="text-gray-400 mb-1">
            Aspiring Software Engineer | Open to Opportunities
          </p>
          <p className="text-gray-500 text-sm">
            New York, NY | 500+ connections
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="border-b border-slate-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
