"use server";

import { List, ListItem, ListItemButton } from "@mui/material";
import { getFilesAndDirectories } from "../server";

const OldBrowser = async ({ path }: { path: string }) => {
    const items = await getFilesAndDirectories(path);
    return (
        <List>
            {items.map(item => (
                <ListItem key={item.name}>
                    {item.type == "directory" ? (
                        <ListItemButton href={path ? `/old/${path}/${item.name}` : item.name}>{item.name}</ListItemButton>
                    ) : (
                        <iframe className="w-screen h-screen" src={item.url} />
                    )}
                </ListItem>
            ))}
        </List>
    );
};

export default OldBrowser;