import { Avatar, Box, Container, Divider, FormControl, InputLabel, Link, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { Forum } from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { RestApiClient } from "./api/RestApiClient";
import { Copyright } from "./components/Copyright";
import { LANGUAGES } from "./languages";
// import { useDeviceState } from "./hooks/useDeviceState";
import { RoomInfo } from "./types/types";

const REC_STATE = {
    STOP: "STOP",
    LISTENING: "LISTENING",
    SPEAKING: "SPEAKING",
} as const;

type REC_START = typeof REC_STATE[keyof typeof REC_STATE];

const App = () => {
    const code = useMemo(() => {
        const query = new URLSearchParams(window.location.search);
        return query.get("token") || "";
    }, []);

    const restApiClient = useMemo(() => {
        const proto = window.location.protocol;
        const host = window.location.host;
        return new RestApiClient(`${proto}//${host}`);
    }, []);

    const [roomInfo, setRoomInfo] = useState<RoomInfo>();
    // const { reloadDevices, audioInputList } = useDeviceState();
    // const [audioInputDeviceId, setAudioInputDeviceId] = useState<string>();
    const [recState, setRecState] = useState<REC_START>(REC_STATE.STOP);
    const [words, setWords] = useState<string>("");
    const [wordsSent, setWordsSent] = useState<boolean>(false);

    const [teamId, setTeamId] = useState("");
    const [channelId, setChannelId] = useState("");
    const [ts, setTs] = useState("");

    const [replaceWordInput, setReplaceWordInput] = useState("");
    const [replaceWordOutput, setReplaceWordOutput] = useState("");

    const [languageKey, setLanguageKey] = useState("default" as keyof typeof LANGUAGES | "default");
    useEffect(() => {
        restApiClient.decodeInformation(code).then((roomInfo) => {
            console.log(roomInfo);
            setRoomInfo(roomInfo);
        });
    }, []);

    const trueEndFlag = useRef<boolean>(false); // Workaround for avoiding first onend event

    const onDeleteClicked = () => {
        console.log(`DELETE ${teamId} ${channelId}, ${ts}`);
        restApiClient.deleteWords(teamId, channelId, ts);
    };

    const onAddReplaceWordClicked = () => {
        console.log(`ddReplaceWord ${teamId} ${channelId}, ${ts}`);
        restApiClient.addReplaceWord(teamId, replaceWordInput, replaceWordOutput);
    };

    // const onReloadDeviceClicked = () => {
    //     reloadDevices();
    // };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
        const recognition = new SpeechRecognition();
        if (languageKey === "default") {
            console.log(`default language ${navigator.language}`);
            recognition.lang = navigator.language;
        } else {
            recognition.lang = LANGUAGES[languageKey];
        }
        recognition.interimResults = true;
        // recognition.continuous = true;
        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
            setRecState(REC_STATE.SPEAKING);
            console.log("res;", event.results);
            setWords(event.results[0][0].transcript as string);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (event.results[0].isFinal) {
                setWordsSent(true);
                restApiClient.sendWords(code, event.results[0][0].transcript).then((res) => {
                    console.log(res);
                });
            } else {
                setWordsSent(false);
            }
        };
        recognition.onstart = (event: any) => {
            console.log("start:", event);
            setRecState(REC_STATE.LISTENING);
        };
        recognition.onaudioend = (event: any) => {
            console.log("onaudioend:", event);
        };
        recognition.onaudiostart = (event: any) => {
            console.log("onaudiostart:", event);
        };
        recognition.onend = (event: any) => {
            console.log("onend:", event);
            setRecState(REC_STATE.STOP);
            if (trueEndFlag.current === true) {
                trueEndFlag.current = false;
                recognition.start();
            }
        };
        recognition.onerror = (event: any) => {
            console.log("onerror:", event);
            trueEndFlag.current = true;
            // setTimeout(() => {
            //     recognition.start();
            // }, 1000 * 1);
        };
        recognition.onnomatch = (event: any) => {
            console.log("onnomatch:", event);
        };
        recognition.onsoundend = (event: any) => {
            console.log("onsoundend:", event);
        };
        recognition.onsoundstart = (event: any) => {
            console.log("onsoundstart:", event);
        };
        recognition.onspeechend = (event: any) => {
            console.log("onspeechend:", event);
            trueEndFlag.current = true;
            // setTimeout(() => {
            //     recognition.start();
            // }, 1000 * 1);
        };
        recognition.onspeechstart = (event: any) => {
            console.log("onspeechstart:", event);
        };
        recognition.start();

        // setInterval(() => {
        //     recognition.start();
        // }, 1000 * 10);

        return () => {
            recognition.onend = () => {};
            recognition.stop();
        };
    }, [languageKey]);

    return (
        <Container maxWidth="xs">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "solid" }}>
                <div style={{ margin: "20px" }}>
                    <Avatar>
                        <Forum />
                    </Avatar>
                </div>
                <div style={{ margin: "20px" }}>
                    <Typography variant="h4">Speech-To-Text-Chat</Typography>
                </div>
                <div style={{ margin: "20px" }}>
                    <Typography variant="h4">{recState}</Typography>
                </div>
                <div style={{ margin: "20px" }}>
                    <Typography variant="h4" style={{ color: wordsSent ? "grey" : "black" }}>
                        {words}
                    </Typography>
                </div>

                <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
                    <div style={{ margin: "1px" }}>Channle:{roomInfo?.channel_name}</div>
                    <div style={{ margin: "1px" }}>Room:{roomInfo?.room_name}</div>
                    <div style={{ margin: "1px" }}>UserName:{roomInfo?.user_name}</div>
                    <img src={roomInfo?.image_url} />
                </div>

                <FormControl>
                    <InputLabel>Language</InputLabel>
                    <Select
                        onChange={(e) => {
                            setLanguageKey(e.target.value! as keyof typeof LANGUAGES | "default");
                        }}
                        defaultValue={languageKey}
                    >
                        <MenuItem disabled value="Language">
                            <em>Language</em>
                        </MenuItem>
                        <MenuItem value="default" key="default">
                            default
                        </MenuItem>
                        ;
                        {Object.keys(LANGUAGES).map((lang) => {
                            return (
                                <MenuItem value={lang} key={lang}>
                                    {lang}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                <div style={{ margin: "20px" }}></div>
                <div>debug</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div>
                        <TextField required variant="standard" margin="normal" fullWidth id="team_id" name="team_id" label="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                    </div>
                    <div>
                        <TextField
                            required
                            variant="standard"
                            margin="normal"
                            fullWidth
                            id="channel_id"
                            name="channel_id"
                            label="channel_id"
                            value={channelId}
                            onChange={(e) => setChannelId(e.target.value)}
                            // InputProps={{
                            //     className: classes.input,
                            // }}
                        />
                    </div>
                    <div>
                        <TextField
                            required
                            variant="standard"
                            margin="normal"
                            fullWidth
                            id="ts"
                            name="ts"
                            label="ts"
                            value={ts}
                            onChange={(e) => setTs(e.target.value)}
                            // InputProps={{
                            //     className: classes.input,
                            // }}
                        />
                    </div>
                    <div style={{ verticalAlign: "bottom" }}>
                        <Link onClick={onDeleteClicked}>Delete</Link>
                    </div>
                    {/* <Button fullWidth variant="outlined" color="primary" >
                        reload device list
                    </Button> */}
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div>
                        <TextField required variant="standard" margin="normal" fullWidth id="input_word" name="input_word" label="input_word" value={replaceWordInput} onChange={(e) => setReplaceWordInput(e.target.value)} />
                    </div>
                    <div>
                        <TextField required variant="standard" margin="normal" fullWidth id="output_word" name="output_word" label="output_word" value={replaceWordOutput} onChange={(e) => setReplaceWordOutput(e.target.value)} />
                    </div>
                    <div style={{ verticalAlign: "bottom" }}>
                        <Link onClick={onAddReplaceWordClicked}>Add Replace Word</Link>
                    </div>
                    {/* <Button fullWidth variant="outlined" color="primary" >
                        reload device list
                    </Button> */}
                </div>

                {/* <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
                    <Button fullWidth variant="outlined" color="primary" onClick={onReloadDeviceClicked}>
                        reload device list
                    </Button>

                    <FormControl>
                        <InputLabel>Microhpone</InputLabel>
                        <Select
                            onChange={(e) => {
                                setAudioInputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={audioInputDeviceId}
                        >
                            <MenuItem disabled value="Video">
                                <em>Microphone</em>
                            </MenuItem>
                            {audioInputList?.map((dev) => {
                                return (
                                    <MenuItem value={dev.deviceId} key={dev.deviceId}>
                                        {dev.short}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div> */}
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container>
    );
};
export default App;
