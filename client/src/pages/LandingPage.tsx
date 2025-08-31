
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,

} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

const LandingPage: React.FC = () => {
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

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      avatar: '/avatars/sarah.jpg',
      quote: 'ExperienceHub helped me showcase my internships and projects in a professional way. I got hired within 2 weeks of publishing my portfolio!',
    },
    {
      name: 'Tech University',
      role: 'Educational Institution',
      avatar: '/avatars/tech-uni.jpg',
      quote: 'We use ExperienceHub to verify and track our students\' experiences. It has streamlined our certification process significantly.',
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      avatar: '/avatars/david.jpg',
      quote: 'The verification system gave my achievements credibility. Employers trust the platform and it made job hunting much easier.',
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
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-xl font-bold text-white">Academix</span>
                </div>
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
      <section className="relative py-20 sm:py-32">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-900/60"></div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
            alt="Modern office space with professionals collaborating"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-3xl">
            <motion.h1 
              className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Verify Experiences, Empower Futures
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Academix connects organizations with verified student experiences, streamlining verification and empowering students to showcase their skills.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to={ROUTES.REGISTER}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
                  Register
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium text-lg border border-slate-600">
                  Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Organizations Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg font-medium text-gray-400 mb-4">For Organizations</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Streamline Verification and Connect with Top Talent
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Academix provides organizations with a centralized platform to verify student experiences, 
              manage student data, and connect with qualified candidates.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Efficient Verification',
                description: 'Quickly and accurately verify student experiences with our streamlined verification process.',
                icon: '✓'
              },
              {
                title: 'Centralized Student Management',
                description: 'Manage student data, track progress, and communicate effectively with students.',
                icon: '👥'
              },
              {
                title: 'Access Top Talent',
                description: 'Connect with top talent by accessing verified student portfolios and experience data.',
                icon: '🎯'
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From verification to showcase, we provide all the tools you need to build a compelling professional profile.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and create your student or organization profile. Add your basic information and preferences.',
              },
              {
                step: '02',
                title: 'Add & Verify Experiences',
                description: 'Add your internships, projects, courses, and achievements. Get them verified by trusted organizations.',
              },
              {
                step: '03',
                title: 'Build Your Portfolio',
                description: 'Showcase your verified experiences in a beautiful, professional portfolio that employers will love.',
              },
            ].map((step, index) => (
              <motion.div 
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What our users say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students and organizations who trust ExperienceHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.name}
                className="bg-white rounded-xl p-6 shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to showcase your experiences?
          </motion.h2>
          <motion.p 
            className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of students and organizations already using ExperienceHub to verify and showcase achievements.
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
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold text-white">ExperienceHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The platform for students to verify, showcase, and discover educational experiences 
                with trusted organizations.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to={ROUTES.EXPLORE} className="text-gray-400 hover:text-white transition-colors">Explore</Link></li>
                <li><Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to={ROUTES.CONTACT} className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to={ROUTES.PRIVACY} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to={ROUTES.TERMS} className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 ExperienceHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
