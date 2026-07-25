import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Michael Ayala",
  DESCRIPTION: "Welcome to My Portfolio",
  AUTHOR: "Mark Horn",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "msayala.2015@gmail.com",
    HREF: "mailto:msayala.2015@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "michaelsayala",
    HREF: "https://github.com/michaelsayala"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "michaelsayala",
    HREF: "https://www.linkedin.com/in/michaelsayala",
  },
]

