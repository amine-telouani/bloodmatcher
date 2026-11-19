# Blood Donation Matcher (BloodMatcher)

Spring Boot app that turns a hospital's urgent blood request into a targeted alert. It notifies only donors who are compatible, eligible and nearby, and widens the search automatically if too few respond.

> Temporary setup guide. Follow it top to bottom before writing any code.

## 1. Prerequisites

Install these first:

| Tool | Version | Notes |
|------|---------|-------|
| JDK | 21 or higher | Check with `java -version` |
| Maven | bundled with IntelliJ | No separate install needed |
| IntelliJ IDEA | any recent version | Community edition is enough |
| PostgreSQL | 18.x (16+ works) | Includes pgAdmin |
| Git | any recent version | Check with `git --version` |

You also need a GitHub account that has been added as a collaborator on the repo.

## 2. Tech stack

- Spring Boot 4.1.2, Java 21+, Maven
- Spring Web MVC, Spring Data JPA (Hibernate), Spring Security, Validation, Mail
- PostgreSQL
- Lombok
- JUnit and Mockito for tests (included in spring-boot-starter-test)

Note: Spring Boot 4 starter names differ from Boot 3. The web starter is `spring-boot-starter-webmvc` (not `starter-web`).

## 3. Get the project

```
git clone https://github.com/amine-telouani/bloodmatcher.git
cd bloodmatcher
```

Open the folder in IntelliJ. Maven imports `pom.xml` automatically. If anything is red, right-click `pom.xml` > Maven > Reload project.

Root package: `com.bloodmatcher.bloodmatcher`
Maven coordinates: groupId `com.bloodmatcher`, artifactId `bloodmatcher`

## 4. Set up the database

1. Start PostgreSQL.
2. Open pgAdmin and create a database named `bloodmatcher`.
3. Default connection used by the app:
   - Host: `localhost`, port `5432`
   - User: `postgres`
   - Password: whatever you chose at install (see next step)

Tables are created automatically by Hibernate (`ddl-auto=update`).

## 5. Set your DB password (never commit it)

The password is read from an environment variable, not stored in the repo. `application.properties` must keep reading exactly `spring.datasource.password=${DB_PASSWORD}`.

1. Run the app once from the green arrow next to `main` in `BloodmatcherApplication`. It fails to connect, but IntelliJ creates the run configuration.
2. Run > Edit Configurations > select `BloodmatcherApplication` > Modify options > tick **Environment variables**.
3. Add `DB_PASSWORD=your_postgres_password` (no quotes, no spaces, no trailing `;`).
4. If the configuration name is shown in italics, choose **Save Configuration**.
5. Run again.

Before every commit, check that no real password is in the diff:

```
git diff src/main/resources/application.properties
```

## 6. Enable Lombok

If getters/setters show red:
- Settings > Build, Execution, Deployment > Compiler > Annotation Processors > tick "Enable annotation processing".
- Install the Lombok plugin if IntelliJ asks (recent versions include it).

## 7. Run it

Run `BloodmatcherApplication`. You should see in the console:

- `Started BloodmatcherApplication`
- `Tomcat started on port 8080`
- A line with `Using generated security password: ...`

Use `/api/auth/**` for public authentication and registration endpoints. Protected `/api/requests`, `/api/donors`, `/api/responses`, `/api/admin`, and related endpoints require HTTP Basic authentication with an enabled account.

## 8. Run the tests

Right-click the `java` folder under `src/test` > Run 'All Tests', or a single test class > Run. Tests live in `src/test/java`, in the same package structure as the code. From a terminal at the project root: `.\mvnw test` on Windows, `./mvnw test` elsewhere.

`BloodmatcherApplicationTests` starts the whole app, so it needs PostgreSQL running and `DB_PASSWORD` set for tests too: Run > Edit Configurations > Edit configuration templates > JUnit > Environment variables > add `DB_PASSWORD=your_postgres_password`.

## 9. Common problems

| Problem | Fix |
|---------|-----|
| `password authentication failed` | `DB_PASSWORD` is missing or wrong in the run configuration |
| `password authentication failed` but the password works in pgAdmin | The variable is not reaching Spring. Check that the run configuration exists and is saved, has no typo, and that `application.properties` reads exactly `${DB_PASSWORD}` |
| `database "bloodmatcher" does not exist` | Create it in pgAdmin |
| Connection refused on 5432 | PostgreSQL is not running |
| `release version 21 not supported` | Your JDK is older than 21 |
| Red imports in IntelliJ | Maven > Reload project; check File > Project Structure that SDK and language level are 21 |
| No green run arrow on tests | Mark `src/test/java` as Test Sources Root (right-click > Mark Directory as) |
| Getters not found | Enable Lombok annotation processing |

## 10. Project structure

Packages under `com.bloodmatcher.bloodmatcher`:

```
entity      JPA entities
enums       BloodType, Role, Urgency, RequestStatus, ResponseStatus
repository  Spring Data repositories
service     business logic (matching, requests, responses)
controller  REST endpoints
dto         request/response objects
config      security and app configuration
util        helpers (GeoUtils)
```

Flow: controller > service > repository. Controllers never touch the database directly.

## 11. Git workflow

- `main` must always run. Nobody commits directly to it.
- One feature branch at a time, created from an up-to-date main:

```
git checkout main
git pull
git checkout -b feature/your-task
```

- Commit small, with clear messages. Push the branch, open a Pull Request, let your partner glance at it, merge, then both run `git pull` on main.
- Do not edit the same file at the same time. `application.properties` and `pom.xml` are shared, so warn each other before touching them.

## 12. Team, branches and status

| Partner | Branches | Status |
|---------|----------|--------|
| A | authentication | implemented (registration, login, BCrypt, Spring Security) |
| A/B | request endpoints | implemented (create, read, cancel) |
| A | donor endpoints | implemented (update profile, notified alerts) |
| A | response endpoints | implemented (accept, decline, donated) |
| A | donation and matching pipeline | implemented (eligibility, cooldown, radius, exact-match ranking, top-N notification) |
| A/B | event publishing | implemented (DonorsMatchedEvent and after-commit notification listener) |
| B | escalation scheduler | implemented |
| B | admin endpoints and demo seed data | implemented |
| A/B | tests | 95 passing |

Shared names: enums in `enums` (`BloodType` constants `A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG`); latitude and longitude are `double`, `lastDonationDate` is `LocalDate`, `available` is `boolean`; every enum is stored with `@Enumerated(EnumType.STRING)`.