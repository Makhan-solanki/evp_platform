import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
 
  ShieldCheckIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  ChartBarIcon,

  ArrowRightIcon,
  BookOpenIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

const AboutPage: React.FC = () => {
  const resources = [
    {
      icon: BookOpenIcon,
      title: 'Getting Started Guide',
      description: 'Learn how to create your first portfolio and get your experiences verified.',
      link: '#',
      category: 'Student'
    },
    {
      icon: DocumentTextIcon,
      title: 'Verification Process',
      description: 'Understand how the verification process works and what documents you need.',
      link: '#',
      category: 'Student'
    },
    {
      icon: VideoCameraIcon,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for using all platform features.',
      link: '#',
      category: 'Both'
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'FAQ',
      description: 'Find answers to commonly asked questions about the platform.',
      link: '#',
      category: 'Both'
    },
    {
      icon: UserGroupIcon,
      title: 'Organization Setup',
      description: 'Guide for organizations to set up verification processes.',
      link: '#',
      category: 'Organization'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Guide',
      description: 'Learn how to use analytics to track student progress and engagement.',
      link: '#',
      category: 'Organization'
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Experiences',
      description: 'Get your internships, projects, and achievements verified by trusted organizations.',
    },
    {
      icon: RocketLaunchIcon,
      title: 'Showcase Portfolio',
      description: 'Build a stunning portfolio to showcase your verified experiences to potential employers.',
    },
    {
      icon: UserGroupIcon,
      title: 'Connect with Organizations',
      description: 'Connect with universities, companies, and organizations to build your professional network.',
    },
    {
      icon: ChartBarIcon,
      title: 'Track Progress',
      description: 'Monitor your learning journey and track your skill development over time.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-xl font-bold text-white">Academix</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link 
                to={ROUTES.ORGANIZATION_DASHBOARD}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                For Organizations
              </Link>
              <Link 
                to={ROUTES.STUDENT_DASHBOARD}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                For Students
              </Link>
              <Link 
                to={ROUTES.ABOUT}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Resources
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                  Register
                </Button>
              </Link>
              <Link 
                to={ROUTES.LOGIN}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl sm:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About ExperienceHub
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're building the future of verified student experiences, connecting talented students with trusted organizations to create a more transparent and credible educational ecosystem.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose ExperienceHub?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform provides the tools and infrastructure needed to verify, showcase, and discover student experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-slate-800 p-6 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Resources & Documentation
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to get started and make the most of ExperienceHub.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                className="bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start justify-between mb-4">
                  <resource.icon className="h-8 w-8 text-blue-500" />
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {resource.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                <p className="text-gray-300 mb-4">{resource.description}</p>
                <Link 
                  to={resource.link}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Learn more
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to get started?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of students and organizations already using ExperienceHub.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to={ROUTES.REGISTER}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
