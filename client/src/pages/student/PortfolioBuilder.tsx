import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';
import { 
  setPortfolio, 
  updatePortfolio, 
  addSection, 
  updateSection, 
  removeSection, 
  reorderSections, 
  setIsEditing,
  savePortfolio,
  publishPortfolio,
  PortfolioData,
  PortfolioSection 
} from '@/store/slices/portfolioSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import toast from 'react-hot-toast';

const PortfolioBuilder: React.FC = () => {
  const { user, student } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { portfolio, isLoading, isEditing } = useAppSelector(state => state.portfolio);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const themes = [
    { value: 'modern', label: 'Modern', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { value: 'professional', label: 'Professional', preview: 'bg-gradient-to-r from-gray-700 to-gray-900' },
    { value: 'creative', label: 'Creative', preview: 'bg-gradient-to-r from-pink-500 to-orange-500' },
    { value: 'minimal', label: 'Minimal', preview: 'bg-gradient-to-r from-white to-gray-100' },
  ];

  const defaultSections = [
    { id: 'about', title: 'About Me', content: 'Tell your story...', order: 1 },
    { id: 'experience', title: 'Experience', content: 'Share your work experience...', order: 2 },
    { id: 'education', title: 'Education', content: 'Your academic background...', order: 3 },
    { id: 'skills', title: 'Skills', content: 'Your technical and soft skills...', order: 4 },
    { id: 'projects', title: 'Projects', content: 'Showcase your projects...', order: 5 },
  ];

  useEffect(() => {
    // Initialize portfolio if it doesn't exist
    if (!portfolio && user?.id) {
      const initialPortfolio: PortfolioData = {
        userId: user.id,
        title: student?.fullName || 'My Portfolio',
        subtitle: 'Student Portfolio',
        bio: '',
        theme: 'modern',
        sections: defaultSections,
        isPublished: false,
      };
      dispatch(setPortfolio(initialPortfolio));
    }
  }, [portfolio, user, student, dispatch]);

  const handleSave = async () => {
    if (!portfolio || !user?.id) return;

    try {
      await dispatch(savePortfolio(portfolio)).unwrap();
      toast.success('Portfolio saved successfully!');
      dispatch(setIsEditing(false));
    } catch (error) {
      toast.error('Failed to save portfolio');
      console.error('Error saving portfolio:', error);
    }
  };

  const handlePublish = async () => {
    if (!portfolio?.id) {
      await handleSave();
    }
    
    try {
      await dispatch(publishPortfolio(portfolio?.id || '1')).unwrap();
      toast.success('Portfolio published successfully!');
      navigate(ROUTES.STUDENT_PORTFOLIO);
    } catch (error) {
      toast.error('Failed to publish portfolio');
      console.error('Error publishing portfolio:', error);
    }
  };

  const handlePreview = () => {
    if (portfolio) {
      // Save current state and navigate to portfolio view
      dispatch(savePortfolio(portfolio));
      navigate(ROUTES.STUDENT_PORTFOLIO);
    }
  };

  const addNewSection = () => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: 'Add your content here...',
      order: (portfolio?.sections.length || 0) + 1,
    };
    dispatch(addSection(newSection));
    setActiveSection(newSection.id);
  };

  const updateSectionData = (id: string, updates: Partial<PortfolioSection>) => {
    dispatch(updateSection({ id, updates }));
  };

  const removeSectionData = (id: string) => {
    dispatch(removeSection(id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    if (!portfolio) return;

    const sections = [...portfolio.sections];
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    // Update order numbers
    sections.forEach((section, idx) => {
      section.order = idx + 1;
    });

    dispatch(reorderSections(sections));
  };

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Builder</h1>
              <p className="text-gray-600 mt-2">
                Create and customize your professional portfolio
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={handlePreview}
                className="flex items-center"
                disabled={isLoading}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </Button>
              {isEditing ? (
                <Button onClick={handleSave} className="flex items-center" disabled={isLoading}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Portfolio'}
                </Button>
              ) : (
                <Button
                  onClick={() => dispatch(setIsEditing(true))}
                  className="flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Portfolio
                </Button>
              )}
              <Button
                onClick={handlePublish}
                className="flex items-center bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Portfolio Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Settings</h2>
              
              <div className="space-y-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Title
                  </label>
                  <Input
                    value={portfolio.title}
                    onChange={(e) => dispatch(updatePortfolio({ title: e.target.value }))}
                    placeholder="Enter portfolio title"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <Input
                    value={portfolio.subtitle}
                    onChange={(e) => dispatch(updatePortfolio({ subtitle: e.target.value }))}
                    placeholder="Enter subtitle"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={portfolio.bio}
                    onChange={(e) => dispatch(updatePortfolio({ bio: e.target.value }))}
                    placeholder="Tell your story..."
                    rows={4}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => dispatch(updatePortfolio({ theme: theme.value }))}
                        disabled={!isEditing}
                        className={cn(
                          'p-3 rounded-lg border-2 text-sm font-medium transition-colors',
                          portfolio.theme === theme.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300',
                          !isEditing && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className={cn('w-full h-8 rounded mb-2', theme.preview)} />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Sections</h2>
                {isEditing && (
                  <Button
                    onClick={addNewSection}
                    variant="secondary"
                    size="sm"
                    className="flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {portfolio.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      'border rounded-lg p-4 transition-all',
                      activeSection === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <Input
                            value={section.title}
                            onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
                            className="font-medium text-gray-900"
                          />
                        ) : (
                          <h3 className="font-medium text-gray-900">{section.title}</h3>
                        )}
                      </div>
                      
                      {isEditing && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={index === portfolio.sections.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeSectionData(section.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSectionData(section.id, { content: e.target.value })}
                        placeholder="Add your content here..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {portfolio.sections.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start building your portfolio by adding sections
                  </p>
                  {isEditing && (
                    <Button onClick={addNewSection} className="flex items-center mx-auto">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Your First Section
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilder;
