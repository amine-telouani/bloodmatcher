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
git clone https://github.com/atel12345/bloodmatcher.git
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

The password is read from an environment variable, not stored in the repo.

In IntelliJ: Run > Edit Configurations > select `BloodmatcherApplication` > Environment variables, then add:

```
DB_PASSWORD=your_postgres_password
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

Open http://localhost:8080 and log in with user `user` and the generated password. A Whitelabel 404 page after login is expected for now (no controllers yet).

## 8. Run the tests

Right-click a test class in the Project panel > Run. Tests live in `src/test/java`, in the same package structure as the code. Or from a terminal at the project root: `mvn test` (`mvnw test` on Windows with the wrapper).

## 9. Common problems

| Problem | Fix |
|---------|-----|
| `password authentication failed` | `DB_PASSWORD` is missing or wrong in the run configuration |
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

## 12. Team and branches

| Partner | Branches |
|---------|----------|
| A | `feature/matching`, `feature/security`, `feature/request-endpoints` |
| B | `feature/entities` (first, A depends on it), `feature/scheduler-events`, `feature/admin-seed` |