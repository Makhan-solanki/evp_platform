// Redux hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export common hooks
export { useEffect, useState, useCallback, useMemo, useRef } from 'react';
export { useNavigate, useLocation, useParams } from 'react-router-dom';
export { useForm } from 'react-hook-form';

// Custom hooks will be added here as we build them
export * from './useAuth';
export * from './useLocalStorage';
export * from './useDebounce';
export * from './useClickOutside';
