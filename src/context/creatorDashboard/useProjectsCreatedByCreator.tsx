import { createContext, useContext, useState } from "react";

import { CreatorOwnProjects } from "src/interfaces/datas/user";
import { getCreatorOwnProjects } from "src/services/apiService/users/getCreatorOwnProjects";

export enum ProjectStagesType {
    drafted = "drafted",
    launched = "launched",
    failed = "failed",
    completed = "completed",
    default = "default"
}

interface ProjectsCreatedByCreatorContextType {
    payload: ProjectsCreatedByCreatorType;
    OnGettingProjectCreatedByCreator: () => Promise<void>;
    OnChangeProjectStageType: (projectType: string) => void;
}

interface ProjectsCreatedByCreatorType {
    ProjectsCreatedByCreator: CreatorOwnProjects;
    isLoading: boolean;
    error: boolean;
    currentProjectType: ProjectStagesType;
}

const InitializeProjectsCreatedByCreator: ProjectsCreatedByCreatorType = {
    ProjectsCreatedByCreator: {} as CreatorOwnProjects,
    isLoading: false,
    error: false,
    currentProjectType: ProjectStagesType.default
};

const ProjectsCreatedByCreatorContext = createContext<ProjectsCreatedByCreatorContextType | undefined>(undefined);

export function ProjectsCreatedByCreatorProvider({
    children,
    projectType
}: {
    children: React.ReactNode;
    projectType: string;
}) {
    const [ProjectsCreatedByCreatorPayload, setProjectCreatedByCreatorPayload] = useState<ProjectsCreatedByCreatorType>(InitializeProjectsCreatedByCreator);

    const OnGettingProjectCreatedByCreator = async () => {
        // Start loading and reset error
        setProjectCreatedByCreatorPayload({
            ...ProjectsCreatedByCreatorPayload,
            isLoading: true,
            error: false
        });

        try {
            const response = await getCreatorOwnProjects();

            // If response.data exists, update state with fetched data
            setProjectCreatedByCreatorPayload({
                ...ProjectsCreatedByCreatorPayload,
                ProjectsCreatedByCreator: response.data || {},
                isLoading: false,
                error: false,
            });
        } catch (err) {
            // Set error state if there's an exception
            setProjectCreatedByCreatorPayload({
                ...ProjectsCreatedByCreatorPayload,
                isLoading: false,
                error: true,
            });
        }
    };

    const OnChangeProjectStageType = (projectType: string) => {
        setProjectCreatedByCreatorPayload({
            ...ProjectsCreatedByCreatorPayload,
            currentProjectType: projectType as ProjectStagesType,
        });
    };

    return (
        <ProjectsCreatedByCreatorContext.Provider
            value={{
                payload: ProjectsCreatedByCreatorPayload,
                OnGettingProjectCreatedByCreator: OnGettingProjectCreatedByCreator,
                OnChangeProjectStageType: OnChangeProjectStageType
            }}>
            {children}
        </ProjectsCreatedByCreatorContext.Provider>
    );
}

export const useProjectsCreatedByCreator = () => {
    const context = useContext(ProjectsCreatedByCreatorContext);
    if (context === undefined) {
        throw new Error("useProjectsCreatedByCreator must be used within a ProjectsCreatedByCreatorProvider");
    }
    return context;
};
