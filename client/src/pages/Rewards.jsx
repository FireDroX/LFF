import { WEEKLY_OPTIONS, ISVALUE_OPTIONS } from "../utils/pointOptions";
import Leaderboard from "../components/Leaderboard/Leaderboard";

const pointOptions = {
  ...WEEKLY_OPTIONS,
  ...ISVALUE_OPTIONS,
};

const TOKEN_REWARDS = ["500 / 300 / 150", "300 / 200 / 100", "200 / 100 / 50"];

const makeTokenUsers = (type) => [
  ...TOKEN_REWARDS.map((score) => ({
    name: `${score} Tokens`,
    score: type,
  })),
];

const makePermanentUsers = () =>
  Array.from({ length: 3 }, () => ({
    name: "Classement permanant",
    score: "ISLAND",
  }));

const CATEGORY_CONFIG = {
  crystaux: { type: "GANG", weeklyLabel: "Si GANG top 1, 2 ou 3" },
  pvp: { type: "GANG", weeklyLabel: "Si GANG top 1, 2 ou 3" },
  iscoin: { type: "ISLAND", weeklyLabel: "Si ISLAND top 1, 2 ou 3" },
  dragonegg: { permanent: true },
  beacon: { permanent: true },
  sponge: { permanent: true },
};

const buildTops = () =>
  Object.fromEntries(
    Object.entries(CATEGORY_CONFIG.map ? {} : CATEGORY_CONFIG).map(
      ([key, config]) => {
        if (config.permanent) {
          return [
            key,
            {
              users: [
                ...makePermanentUsers(),
                {
                  name: "Stats de participation",
                  score: "STATS",
                  userId: "debug",
                },
              ],
            },
          ];
        }

        return [
          key,
          {
            users: [
              ...makeTokenUsers(config.type),
              {
                name: config.weeklyLabel,
                score: "WEEKLY",
                userId: "debug",
              },
            ],
          },
        ];
      },
    ),
  );

const tops = buildTops();

const Rewards = () => {
  return (
    <section className="App">
      <div className="lff-classements-container">
        {Object.keys(CATEGORY_CONFIG).map((k) => (
          <Leaderboard
            key={k}
            title={
              <>
                <img
                  className="lff-classements-icon"
                  src={pointOptions[k].icon}
                  alt={pointOptions[k].label}
                />
                {pointOptions[k].label}
              </>
            }
            top={tops[k]?.users}
            requiredAmount={pointOptions[k].requiredAmount}
            currentUser="debug"
          />
        ))}
      </div>
    </section>
  );
};

export default Rewards;
