package com.exam.portal;

import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ExamPortalApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void runSwallowsFailuresSoApplicationStartupIsNotAborted() {
		// Without injected dependencies the seeding routine fails; the runner must
		// log the failure instead of propagating it.
		ExamPortalApplication application = new ExamPortalApplication();

		assertThatCode(application::run).doesNotThrowAnyException();
	}

}
