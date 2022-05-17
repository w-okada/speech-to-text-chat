import { Link, Typography } from "@mui/material";
import React, { useMemo } from "react";
export const Copyright = () => {
    const copyright = useMemo(() => {
        return (
            <Typography color="textSecondary" align="center">
                Copyright ©
                <Link color="inherit" href="https://www.flect.co.jp/">
                    FLECT, Co., Ltd.
                </Link>
                {new Date().getFullYear()}
            </Typography>
        );
    }, []);
    return <>{copyright}</>;
};
