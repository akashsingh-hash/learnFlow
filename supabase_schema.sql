CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,
  learning_level TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TYPE roadmap_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE task_type AS ENUM ('reading', 'practice', 'project', 'quiz', 'video', 'other');
CREATE TYPE resource_type AS ENUM ('book', 'course', 'documentation', 'tutorial', 'practice');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_category AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'completed');

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration TEXT,
  difficulty roadmap_difficulty NOT NULL,
  progress INTEGER DEFAULT 0, -- 0-100
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_tags (
  roadmap_id UUID REFERENCES public.roadmaps (id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (roadmap_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES public.roadmaps (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_weeks INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.milestone_prerequisites (
  milestone_id UUID REFERENCES public.milestones (id) ON DELETE CASCADE,
  prerequisite_description TEXT NOT NULL,
  PRIMARY KEY (milestone_id, prerequisite_description)
);

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT,
  type resource_type NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roadmap_resources (
  roadmap_id UUID REFERENCES public.roadmaps (id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources (id) ON DELETE CASCADE,
  PRIMARY KEY (roadmap_id, resource_id)
);

-- This table is for tasks within a roadmap's milestones
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.milestones (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type task_type NOT NULL,
  estimated_hours INTEGER
);

CREATE TABLE IF NOT EXISTS public.roadmap_task_resources (
  roadmap_task_id UUID REFERENCES public.roadmap_tasks (id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources (id) ON DELETE CASCADE,
  PRIMARY KEY (roadmap_task_id, resource_id)
);

-- This table is for general user-created tasks, separate from roadmap tasks
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL,
  category task_category NOT NULL,
  status task_status DEFAULT 'todo',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_hours INTEGER
);

CREATE TABLE IF NOT EXISTS public.user_task_tags (
  user_task_id UUID REFERENCES public.user_tasks (id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (user_task_id, tag_id)
);
