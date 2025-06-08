import Home from './views/pages/home';
import AddStory from './views/pages/add-story';
import Login from './views/pages/login';
import Register from './views/pages/register';
import Profile from './views/pages/profile';

const routes = {
    '/': Home,
    '/home': Home,
    '/add': AddStory,
    '/login': Login,
    '/register': Register,
    '/profile': Profile
};

export default routes;
